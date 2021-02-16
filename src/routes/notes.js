const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { isAuthenticated } = require("../helper/auth");

router.get("/notes/add", isAuthenticated, (req, res) => {
  res.render("notes/new-note");
});

router.post("/notes/new-note", isAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  const errors = [];
  if (!title) {
    errors.push({ text: "please type a title" });
  }
  if (!description) {
    errors.push({ text: "please type a description" });
  }
  if (errors.length > 0) {
    res.render("notes/new-note", {
      errors,
      title,
      description,
    });
  } else {
    const newNote = new Note({  title, description });
    newNote.user = req.user.id;
    await newNote.save();
    req.flash("success_msg", "Note added Successfully");
    res.redirect("/notes");
  }
});

router.get("/notes", isAuthenticated, async (req, res) => {
  const notes = await Note.find({user: req.user.id}).sort({ date: "desc" });
  res.render("notes/all-notes", { notes });
});

router.get("/notes/edit/:id", isAuthenticated, async (req, res) => {
  const note = await Note.findById(req.params.id).lean();
  res.render("notes/edit-note", { note });
});

router.post("/notes/edit-note/:id", isAuthenticated, async (req, res) => {
  const note = {
    title: req.body.title,
    description: req.body.description,
    _id: req.params.id,
  };
  const errors = [];
  if (!note.title) {
    errors.push({ text: "please type a title" });
  }
  if (!note.description) {
    errors.push({ text: "please type a description" });
  }
  if (errors.length > 0) {
    res.render("notes/edit-note", {
      errors,
      note,
    });
  } else {
    const { title, description } = req.body;
    const editNote = await Note.findByIdAndUpdate(req.params.id, {
      title,
      description,
    });
    req.flash("success_msg", "Note edited Successfully");
    res.redirect("/notes");
  }
});

router.post("/notes/delete/:id", isAuthenticated, async (req, res) => {
  const deleteNote = await Note.findByIdAndDelete(req.params.id);
  req.flash("error_msg", "your note has ben deleted");
  res.redirect("/notes");
});

module.exports = router;
