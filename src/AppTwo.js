import React from "react";
import "./App.css";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { listNotes } from "./graphql/queries";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import aws_exports from "./aws-exports";
Amplify.configure(aws_exports);

class AppTwo extends React.Component {
  state = {
    id: "",
    notes: [],
    note: ""
  };

  async componentDidMount() {
    await this.getNotes();
  }

  handleChangeNote = event => this.setState({ note: event.target.value });

  hasExistingNote = () => {
    const { notes, id } = this.state;

    if (id) {
      const index = notes.findIndex(note => note.id === id);
      const isNote = index > -1;
      return isNote;
    }
    return false;
  };

  hasNewNote = () => {
    const { note } = this.state;

    if (note.trim()) {
      return true;
    }
    return false;
  };

  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  };

  handleAddNote = async event => {
    const { notes, note } = this.state;

    event.preventDefault();
    if (this.hasExistingNote()) {
      this.handleUpdateNote();
    } else if (this.hasNewNote()) {
      const input = { note };
      const result = await API.graphql(graphqlOperation(createNote, { input }));
      const newNote = result.data.createNote;
      const updatedNotes = [newNote, ...notes];
      this.setState({ notes: updatedNotes, note: "" });
    }
  };

  handleDeleteNote = async noteId => {
    const input = { id: noteId };
    await API.graphql(graphqlOperation(deleteNote, { input }));
    await this.getNotes();
  };

  handleUpdateNote = async () => {
    const { id, note, notes } = this.state;
    const input = { id, note };
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ];
    this.setState({ notes: updatedNotes, note: "", id: "" });
  };

  handleSetNote = ({ note, id }) => this.setState({ note, id });

  render() {
    const { notes, note, id } = this.state;

    return (
      <div className="flex flex-column items-center justify-center bg-washed-red pa3 fl-1">
        <h1 className="code f2-l">Amplify NoteTaker</h1>
        {/* Note Form */}
        <form onSubmit={this.handleAddNote} className="mb3">
          <input
            className="pa2 f4"
            type="text"
            placeholder="Write your note"
            value={note}
            onChange={this.handleChangeNote}
          />
          <button className="pa2 f4" type="submit">
            {id ? "Update Note" : "Add Note"}
          </button>
        </form>

        {/* Notes List */}
        <div>
          {notes.map(note => (
            <div key={note.id} className="flex items-center">
              <li
                onClick={() => this.handleSetNote(note)}
                // style={{ color: deletingId === note.id && "red" }}
                className="list pa1 f3"
              >
                {note.note}
              </li>
              <button
                className="bg-transparent bn f4"
                onClick={() => this.handleDeleteNote(note.id)}
              >
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(AppTwo, true);

// O3397742@nwytg.net
// Ani51372@iencm.com
