import React, { useState, useEffect } from "react";
import "./App.css";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { listNotes } from "./graphql/queries";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import aws_exports from "./aws-exports";
Amplify.configure(aws_exports);

const AppHooks = () => {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState("");
  const [noteIndex, setNoteIndex] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    handleListNotes();
  }, []);

  const handleListNotes = async () => {
    const { data } = await API.graphql(graphqlOperation(listNotes));
    setNotes(data.listNotes.items);
  };

  const hasExistingNote = () => {
    if (noteId) {
      const isNote = notes.findIndex(note => note.id === noteId) > -1;
      return isNote;
    }
    return false;
  };

  const hasNote = () => {
    if (note.trim()) {
      return true;
    }
    return false;
  };

  const handleAddNote = async event => {
    event.preventDefault();

    if (hasExistingNote()) {
      handleUpdateNote();
    } else if (hasNote()) {
      const payload = { note };
      const { data } = await API.graphql(
        graphqlOperation(createNote, { input: payload })
      );
      const newNote = data.createNote;
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setNote("");
    }
  };

  const handleUpdateNote = async () => {
    const payload = { id: noteId, note };
    const { data } = await API.graphql(
      graphqlOperation(updateNote, { input: payload })
    );
    const updatedNote = data.updateNote;
    const updatedNotes = [
      ...notes.slice(0, noteIndex),
      updatedNote,
      ...notes.slice(noteIndex + 1)
    ];
    setNotes(updatedNotes);
    setNote("");
    setNoteId("");
  };

  const handleSetNote = ({ note, id }, index) => {
    setNote(note);
    setNoteId(id);
    setNoteIndex(index);
  };

  const handleDelete = async id => {
    setDeletingId(id);
    const payload = { id };
    const { data } = await API.graphql(
      graphqlOperation(deleteNote, { input: payload })
    );
    const deletedNoteId = data.deleteNote.id;
    const deletedNoteIndex = notes.findIndex(note => note.id === deletedNoteId);
    const updatedNotes = [
      ...notes.slice(0, deletedNoteIndex),
      ...notes.slice(deletedNoteIndex + 1)
    ];
    setNotes(updatedNotes);
    setDeletingId("");
  };

  return (
    <div className="flex flex-column items-center justify-center bg-washed-red pa3 fl-1">
      <h1 className="code f2-l">Amplify NoteTaker</h1>
      {/* Note Form */}
      <form onSubmit={handleAddNote} className="mb3">
        <input
          className="pa2 f4"
          type="text"
          placeholder="Write your note"
          value={note}
          onChange={({ target }) => setNote(target.value)}
        />
        <button className="pa2 f4" type="submit">
          {noteId ? "Update" : "Add"}
        </button>
      </form>

      {/* Notes List */}
      <div>
        {notes.map((note, i) => (
          <div key={note.id} className="flex items-center">
            <li
              onClick={() => handleSetNote(note, i)}
              style={{ color: deletingId === note.id && "red" }}
              className="list pa1 f3"
            >
              {note.note}
            </li>
            <button
              className="bg-transparent bn f4"
              onClick={() => handleDelete(note.id)}
            >
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withAuthenticator(AppHooks, { includeGreetings: true });
