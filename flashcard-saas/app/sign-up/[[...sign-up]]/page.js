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
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  // const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  //   alignItems: "flex-start",
  //   paddingTop: theme.spacing(1),
  //   paddingBottom: theme.spacing(2),
  // }));
  return (
    <Box>
      {/* <AppBar position="static" >
        <StyledToolbar>
          <Typography
            variant="h6"
            marginTop={1}
            // component="div"
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
          Sign Up
        </Typography>
        <SignUp />
      </Box>
    </Box>
  );
}
