'use client'
import getStripe from "./utils/getStripe";
import { Box, Button, Container, Grid, Typography, } from "@mui/material";
import Head from "next/head";
import CustomAppBar from "./components/CustomAppBar";

export default function Home() {
  //This function handles the Stripe checkout process
  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout_session", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  return (
    <Box>
      <Head>
        <title>Studify AI</title> 
        <meta name="description" content="Create flashcards from your text" />
      </Head>

      <CustomAppBar />
      <Container>
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom color={"secondary"}>
            <strong>Studify AI</strong>
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            The easiest way to create flashcards from your text
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, mr: 2 }}
            href="/generate"
          >
            Get Started
          </Button>
        </Box>

        <Box sx={{ my: 6 , padding: 1, }}>
          <Typography variant="h4" component="h2" gutterBottom align='center' padding={1}> 
            Features
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    ":hover": {
                    boxShadow: 6,
                   },
                  }}
                >
                  <Typography variant="h6" gutterBottom color={"secondary"}>
                    Easy Text Input
                  </Typography>
                  <Typography>
                    Simply input your text and let our software do the rest.
                    Creating flashcards has never been easier.
                  </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
            <Box
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  ":hover": {
                    boxShadow: 6,
                   },
                }}
              >
              <Typography variant="h6" gutterBottom color={"secondary"}>
                Smart Flashcards
              </Typography>
              <Typography>
                Our AI intelligently breaks down your text into concise
                flashcards, perfect for studying.
              </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
            <Box
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  ":hover": {
                    boxShadow: 6,
                   },
                }}
              >
              <Typography variant="h6" gutterBottom color={"secondary"}>
                Comprehensive Collection
              </Typography>
              <Typography>
              Bundle your cards together through the collection feature. Add your flashcards to a new or existing collection. 
              </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 6, textAlign: "center" }}>
          <Typography variant="h4" component="h2" gutterBottom padding={1}>
            Pricing
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  border: "3px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h5" gutterBottom color={"secondary"}>
                  Basic
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Free
                </Typography>
                <Typography>
                  Access to basic flashcard features and limited storage
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  href="/generate"
                >
                  Choose Basic
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 3,
                  border: "3px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h5" gutterBottom color={"secondary"}>
                  Pro
                </Typography>
                <Typography variant="h6" gutterBottom>
                  $5 / month
                </Typography>
                <Typography>
                  Unlimited flashcards and storage
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleSubmit}
                >
                  Choose Pro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
