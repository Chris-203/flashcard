"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  Typography,
  Modal,
  Stack,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, writeBatch, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import CustomAppBar from "../components/CustomAppBar";
import { styled } from "@mui/material/styles";
import { useCallback } from "react";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [text, setText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState("new"); // "new" or "existing"
  const [existingCollections, setExistingCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("collection");
  const router = useRouter();

  const fetchCollections = useCallback(async () => {
    if (user) {
      const userDocRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setExistingCollections(collections.map((col) => col.name));
      }
    }
  }, [user]); // Dependency array includes user

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const collectionName = queryParams.get("collection");

    if (collectionName) {
      setMode("existing");
      setSelectedCollection(collectionName);
    }

    if (user) {
      fetchCollections();
    }
  }, [user, fetchCollections]);

  const handleGenerate = async () => {
    if (!user) {
      alert("You must be signed in to generate flashcards.");
      return;
    }
    
    fetch("/api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFlashcards(data);
      });
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveToFirebase = async () => {
    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);

    if (mode === "new") {
      if (!name) {
        alert("Please provide a name for the flashcard collection");
        return;
      }

      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        if (collections.find((f) => f.name === name)) {
          alert("Flashcard collection with the same name already exists");
          return;
        } else {
          collections.push({ name, count: flashcards.length });
          batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }
      } else {
        batch.set(userDocRef, {
          flashcards: [{ name, count: flashcards.length }],
        });
      }

      // Reference the subcollection for the flashcard collection
      const colRef = collection(userDocRef, name);
      flashcards.forEach((flashcard) => {
        const flashcardDocRef = doc(colRef);
        batch.set(flashcardDocRef, flashcard);
      });
    } else if (mode === "existing" && selectedCollection) {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        const existingCollection = collections.find(
          (f) => f.name === selectedCollection
        );

        if (existingCollection) {
          // Update the count of the existing collection by adding the new flashcards
          existingCollection.count += flashcards.length;
          batch.set(userDocRef, { flashcards: collections }, { merge: true });

          // Reference the subcollection for the existing flashcard collection
          const colRef = collection(userDocRef, selectedCollection);
          flashcards.forEach((flashcard) => {
            const flashcardDocRef = doc(colRef);
            batch.set(flashcardDocRef, flashcard);
          });
        } else {
          alert("No collection found with this name");
          return;
        }
      } else {
        alert("User document not found");
        return;
      }
    } else {
      alert("Please select an existing collection");
      return;
    }

    await batch.commit();
    router.push("/flashcards");
  };

  const CustomGrid = styled(Grid)({
    overflowY: "auto",
    maxHeight: "86vh",
    paddingRight: "12px", // Padding to make room for the scrollbar
    marginRight: "-12px", // Negative margin to pull the grid away from the edge
    "&::-webkit-scrollbar": {
      width: "12px", // Width of the scrollbar
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f1f1", // Background color of the scrollbar track
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#888", // Color of the scrollbar thumb
      borderRadius: "10px", // Roundness of the scrollbar thumb
      border: "3px solid transparent", // Space around the scrollbar thumb
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#555", // Color of the scrollbar thumb on hover
    },
  });

  return (
    <Box>
      <CustomAppBar />
      <Box
        mt={4}
        mb={4}
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Generate Flashcards
        </Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Enter text"
          multiline
          rows={4}
          variant="outlined"
          sx={{ mb: 2, width: "500px" }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ width: "150px", height: "60px" }}
          onClick={handleGenerate}
        >
          Generate Flashcards
        </Button>
      </Box>

      {flashcards.length > 0 && (
        <>
          <Box sx={{ mt: 4 }}>
            <Container maxWidth={false} sx={{ px: 2, mt: 1 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Flashcards Preview
              </Typography>
              <CustomGrid container spacing={2} sx={{ mt: -0.5 }}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        backgroundColor: "#9ea9b1",
                        width: "100%",
                        mx: "auto",
                      }}
                    >
                      <CardActionArea onClick={() => handleCardClick(index)}>
                        <CardContent>
                          <Box
                            sx={{
                              perspective: "1000px",
                              "&>div": {
                                transition: "transform 0.6s",
                                transformStyle: "preserve-3d",
                                position: "relative",
                                width: "100%",
                                height: "200px",
                                bgcolor: "#eeeeee", //Card front
                                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                                transform: flipped[index]
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)",
                              },
                              "&>div>div": {
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "2",
                                boxSizing: "border-box",
                              },
                              "&>div>div:nth-of-type(2)": {
                                transform: "rotateY(180deg)",
                                backgroundColor: "white", //card back
                              },
                            }}
                          >
                            <div>
                              <div>
                                <Typography align="center">
                                  {flashcard.front}
                                </Typography>
                              </div>
                              <div>
                                <Typography align="center">
                                  {flashcard.back}
                                </Typography>
                              </div>
                            </div>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </CustomGrid>
            </Container>
          </Box>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mb: 2 }}
              onClick={() => setModalOpen(true)}
            >
              Add to Firebase
            </Button>
          </Box>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Save Flashcards
          </Typography>
          {!collectionName && (
            <RadioGroup
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              row
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="Create New Collection"
              />
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label="Add to Existing Collection"
              />
            </RadioGroup>
          )}
          {mode === "new" && !collectionName && (
            <TextField
              fullWidth
              label="New Collection Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
          {mode === "existing" && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Existing Collection</InputLabel>
              <Select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                label="Existing Collection"
                disabled={!!collectionName}
              >
                {existingCollections.map((collectionName) => (
                  <MenuItem key={collectionName} value={collectionName}>
                    {collectionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={saveToFirebase}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
