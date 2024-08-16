"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  IconButton,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import CustomAppBar from "../components/CustomAppBar";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
        setFilteredFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  useEffect(() => {
    let filtered = flashcards.filter((fc) =>
      fc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortOption === "name") {
      filtered.sort((a, b) => {
        if (sortDirection === "asc") {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    } else if (sortOption === "count") {
      filtered.sort((a, b) => {
        if (sortDirection === "asc") {
          return a.count - b.count;
        } else {
          return b.count - a.count;
        }
      });
    }
    setFilteredFlashcards(filtered);
  }, [flashcards, sortOption, sortDirection, searchQuery]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };
  return (
    <>
      <CustomAppBar />
      <Container maxWidth="md">
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <FormControl variant="outlined" sx={{ mx: 1, minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="count">Count</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" sx={{ mx: 1, minWidth: 120 }}>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                label="Sort Direction"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            <TextField
              variant="outlined"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mx: 1, width: 200 }}
            />
            <IconButton edge="end" color="inherit">
              <Search />
            </IconButton>
          </Grid>
          <Grid container spacing={3}>
            {filteredFlashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea
                    onClick={() => handleCardClick(flashcard.name)}
                  >
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {flashcard.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flashcard.count}{" "}
                        {flashcard.count === 1 ? "card" : "cards"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
