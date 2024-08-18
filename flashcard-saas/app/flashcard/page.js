"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, deleteDoc, } from "firebase/firestore";
import { db } from "@/firebase";
import { useSearchParams } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [collectionName, setCollectionName] = useState("");

  const searchParams = useSearchParams();
  const search = searchParams.get("id");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  //This function below retrieves all flashcards in the specified set from Firestore and updates the `flashcards` state.
  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;

      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        const selectedCollection = collections.find((fc) => fc.name === search);
        console.log(selectedCollection.name);
        if (selectedCollection) {
          setCollectionName(selectedCollection.name);
          const colRef = collection(
            doc(collection(db, "users"), user.id),
            search
          );
          const docs = await getDocs(colRef);
          const flashcardsData = [];
          docs.forEach((doc) => {
            flashcardsData.push({ id: doc.id, ...doc.data() });
          });
          setFlashcards(flashcardsData);
        }
      }
    }
    getFlashcard();
  }, [search, user]);

  //This function toggles the flip state of a flashcard when it’s clicked
  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }
  const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    alignItems: "flex-start",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  }));

  // Function to toggle the drawer open or closed
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // Drawer content with navigation options
  const DrawerList = (
    <Box
      sx={{ width: 250, backgroundColor: "lightblue" }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        {["Home", "Dashboard"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={
                text === "Dashboard"
                  ? () => router.push("/flashcards")
                  : text === "Home"
                  ? () => router.push("/")
                  : undefined
              }
            >
              <ListItemIcon>
                {index % 2 === 0 ? <HomeIcon /> : <DashboardIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
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
      // backgroundClip: 'content-box', // Clipping to show the border as a gap
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#555", // Color of the scrollbar thumb on hover
    },
  });

  const handleDeleteFlashcard = async (id) => {
    try {
      const flashcardDocRef = doc(
        collection(doc(collection(db, "users"), user.id), search),
        id
      );
      await deleteDoc(flashcardDocRef); // Deletes the flashcard from Firestore
      setFlashcards((prev) => prev.filter((flashcard) => flashcard.id !== id)); // Updates the state to remove the deleted flashcard
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  };

  //Each flashcard is displayed as a card that flips when clicked, revealing the back of the card. The flip animation is achieved using CSS transforms and transitions.
  return (
    <Box>
      <AppBar position="static">
        <StyledToolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, marginTop: -0.5 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            open={open}
            onClose={toggleDrawer(false)}
            PaperProps={{
              sx: { backgroundColor: "lightblue" }, // Change the background color of the entire Drawer
            }}
          >
            {DrawerList}
          </Drawer>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {collectionName}
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Sign In
            </Button>
            <Button color="inherit" href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </StyledToolbar>
      </AppBar>
      <Button
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: 56,
          right: 56,
          zIndex: 1000,
          borderRadius: "50%",
          width: 56, // Diameter of the circle
          height: 56, // Diameter of the circle
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => router.push(`/generate?collection=${collectionName}`)}
      >
        <AddIcon sx={{ width: 35, height: 35 }} />
      </Button>
      <Button
        variant="outlined"
        color="primary"
        href="/flashcards"
        sx={{ mt: 3, ml: 3 }}
      >
        Return
      </Button>
      <Container maxWidth={false} sx={{ px: 2, mt: 1 }}>
        <CustomGrid container spacing={2} sx={{ mt: -0.5 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{ backgroundColor: "#9c27b0", width: "100%", mx: "auto" }}
              >
                <CardActionArea
                  onClick={() => {
                    handleCardClick(index);
                  }}
                >
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
                          bgcolor: "lightblue", //Card front
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
                          // backgroundColor: "lightgray",
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
              <Box textAlign={"center"}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleDeleteFlashcard(flashcard.id)} // Call delete function
                  sx={{ m: 1 }}
                >
                  Delete
                </Button>
              </Box>

              </Card>
            </Grid>
          ))}
        </CustomGrid>
      </Container>
    </Box>
  );
}
