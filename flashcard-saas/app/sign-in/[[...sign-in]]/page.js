"use client";
import React from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  // const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  //   alignItems: "flex-start",
  //   paddingTop: theme.spacing(1),
  //   paddingBottom: theme.spacing(2),
  // }));
  return (
    <Box>
      {/* <AppBar position="static">
        <StyledToolbar>
          <Typography
            variant="h6"
            // component="div"
            marginTop={1}
            sx={{ flexGrow: 1 }}
          >
            Flashcard SaaS
          </Typography>
        </StyledToolbar>
      </AppBar> */}

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ textAlign: "center", my: 4, mt: 20 }}
      >
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>
        <SignIn />
      </Box>
    </Box>
  );
}
