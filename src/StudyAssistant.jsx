// ─── React Imports ────────────────────────────────────────────────────────────
import { useState, useEffect, createContext, useContext } from "react";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── In-memory "database" (resets on page refresh — no backend needed) ────────
// Stores registered users as: { email, password, name }
const registeredUsers = [];

// ─── Auth Logic with IF conditions ───────────────────────────────────────────
function validateSignup(name, email, password, confirmPassword) {
  if (!name.trim()) {
    return "Please enter your full name.";
  }
  if (!email.trim()) {
    return "Please enter your email address.";
  }
  if (!email.includes("@") || !email.includes(".")) {
    return "Please enter a valid email address.";
  }
  if (!password) {
    return "Please enter a password.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match. Please try again.";
  }
  const existing = registeredUsers.find(u => u.email === email);
  if (existing) {
    return "This email is already registered. Please sign in instead.";
  }
  return null; // null = no error
}

function validateLogin(email, password) {
  if (!email.trim()) {
    return "Please enter your email address.";
  }
  if (!email.includes("@") || !email.includes(".")) {
    return "Please enter a valid email address.";
  }
  if (!password) {
    return "Please enter your password.";
  }
  const user = registeredUsers.find(u => u.email === email);
  if (!user) {
    return "No account found with this email. Please sign up first.";
  }
  if (user.password !== password) {
    return "Incorrect password. Please try again.";
  }
  return null; // null = no error
}