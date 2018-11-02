import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { listNotes } from "./graphql/queries";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import aws_exports from "./aws-exports";
Amplify.configure(aws_exports);

class App extends Component {
  state = {
    id: "",
    notes: [],
    note: ""
  };

  async componentDidMount() {
    await this.listNotes();
  }

  listNotes = async () => {
    const { data } = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: data.listNotes.items });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = async event => {
    const { id, notes } = this.state;

    event.preventDefault();
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      if (isNote) {
        this.handleUpdate();
      }
    } else {
      this.handleAddNote();
    }
  };

  handleAddNote = async () => {
    const payload = {
      note: this.state.note
    };
    await API.graphql(graphqlOperation(createNote, { input: payload }));
    await this.listNotes();
    this.setState({ note: "" });
  };

  handleDelete = async id => {
    const payload = { id };
    await API.graphql(graphqlOperation(deleteNote, { input: payload }));
    await this.listNotes();
  };

  handleUpdate = async () => {
    const { id, note } = this.state;

    const payload = { id, note };
    await API.graphql(graphqlOperation(updateNote, { input: payload }));
    await this.listNotes();
    this.setState({ id: "", note: "" });
  };

  loadNote = ({ id, note }) => {
    this.setState({ id, note });
  };

  render() {
    const { notes, note } = this.state;

    return (
      <div className="App">
        <h1>Amplify NoteTaker</h1>
        <div className="container">
          <form onSubmit={this.handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="text"
                name="note"
                placeholder="Write your note..."
                value={note}
                onChange={this.handleChange}
                className="form-control form-control-lg"
              />
            </div>
            <div className="input-group-append">
              <button className="btn btn-primary" type="submit">
                Add Note
              </button>
            </div>
          </form>
        </div>
        <div className="container">
          {notes.map(note => (
            <div
              className="alert alert-primary alert-dismissible show"
              role="alert"
              key={note.id}
            >
              <span onClick={() => this.loadNote(note)}>{note.note}</span>
              <button
                type="button"
                className="close"
                data-dismiss="alert"
                onClick={() => this.handleDelete(note.id)}
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

export default withAuthenticator(App, { includeGreetings: true });
