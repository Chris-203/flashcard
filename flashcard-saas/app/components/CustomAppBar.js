"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { styled } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";

const CustomAppBar = ({ defaultTitle }) => {
  const pathname = usePathname(); // Use usePathname hook to get the current path
  const router = useRouter(); // Use useRouter hook for navigation
  const [open, setOpen] = useState(false); // State to manage the drawer's open/close state
  const { user } = useUser(); // Get current user details from Clerk

  // StyledToolbar with custom padding for better layout
  const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    alignItems: "flex-start",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
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

  return (
    <AppBar position="static">
      <StyledToolbar>
        {/* Conditionally render menu icon and drawer based on user's authentication status */}
        {user && (
          <>
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
          </>
        )}

        {/* Use the new TitleComponent to handle title logic based on the route */}
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <TitleComponent defaultTitle={defaultTitle} pathname={pathname} />
        </Typography>

        {/* Show login and signup buttons when the user is signed out */}
        <SignedOut>
          <Button color="inherit" href="/sign-in">
            Sign In
          </Button>
          <Button color="inherit" href="/sign-up">
            Sign Up
          </Button>
        </SignedOut>

        {/* Show user button when the user is signed in */}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </StyledToolbar>
    </AppBar>
  );
};

// TitleComponent is separated to manage title logic based on route and user data
const TitleComponent = ({ defaultTitle, pathname }) => {
  const { user } = useUser(); // useUser hook to get current user details

  // Function to determine the title based on the current route
  const getTitle = () => {
    if (pathname.startsWith("/flashcard")) {
      const pathParts = pathname.split("/");
      const collectionName = pathParts[pathParts.length - 1];
      return collectionName || "Studify AI";
    }
    switch (pathname) {
      case "/flashcards":
        return "Flashcard Dashboard";
      case "/generate":
        return "Generate Flashcards";
      default:
        // If user is logged in, show their first name in the title, otherwise use default
        return user ? `Welcome ${user.firstName || "User"}` : "Studify AI";
    }
  };

  return <>{getTitle()}</>; // Render the title based on the route and user data
};

export default CustomAppBar;
