import React, { Component } from 'react';
import logo from './res/trimlogo.jpg';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress'
import $ from 'jquery';
import { FirestoreDocument } from "react-firestore";
import { VIEWENUM, ERRORENUM} from './constants/enums.js';
import { URL } from './constants/constants.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entryField: '',
      page: VIEWENUM.ENTRY,
      loading: false
    }
  }
  monitorClick = () => {
    var id = this.state.entryField
    if (id === '') {
      this.setState({errorType: ERRORENUM.EMPTY});
      return;
    }

    else if (isNaN(id)) {
      this.setState({errorType: ERRORENUM.NAN});
      return;
    }
    this.setState({loading: true});
    $.get(
      URL,
      {
        id: id
      },
      (data, status) =>
      {
        this.setState({loading: false});
        var proceed = data.result;
        if (proceed) {
          this.setState({id: id});
          this.setState({page: VIEWENUM.MONITOR});
        }
        else {
          this.setState({errorType: ERRORENUM.NOTFOUND});
        }
      }
    )
    .fail(() => {
        this.setState({loading: false});
        this.setState({errorType: ERRORENUM.ERROR});
    })
  }

  returnClick = () => {
      this.setState({entryField: ''})
      this.setState({id: ''});
      this.setState({page: VIEWENUM.ENTRY})
  }

  errorCreator = (errorEnum) => {
    switch(errorEnum) {
      case ERRORENUM.EMPTY:
        return 'Please enter an ID';
      case ERRORENUM.NOTFOUND:
        return 'Chair could not be found';
      case ERRORENUM.NAN:
        return 'Please enter a number';
      case ERRORENUM.ERROR:
        return 'Server Error';
      default:
        return '';
    }
  }
  pageRender = (errorMessage) => {
    const entryView = (
      <div className="App-intro">
        <TextField
          hintText="Enter Chair ID"
          style={{marginBottom:'10px', width:'170px'}}
          onChange={this.handleIdInput}/><br/>
        <RaisedButton
          label="Monitor"
          onClick={this.monitorClick}
          disabled={this.state.loading ? true : false}/><br/>
        {this.state.loading ?
          <div><br/><CircularProgress/></div> : <p style={{color: 'red'}}>{this.errorCreator(this.state.errorType)}</p>
        }
      </div>
    )

    var path = "chairs/" + this.state.id;
    const monitorView = (
      <div>
        <h2 style={{color:'#46969f'}}>Monitoring Chair {this.state.id}</h2>
        <FirestoreDocument
          path={path}
          render={({isLoading, data}) => {
            return isLoading ? (
              <CircularProgress/>
            ) : (
              <div>
                <h3 style={data.occupied ? {color:'red'} : {}}><hr/>{data.occupied ? "Occupied" : "Unoccupied"}</h3>
                {data.occupied ? (<h2>Since: {data.start_time}</h2>) : <div></div>}
                <h1>Count: {data.count}</h1><hr/>
                <h3>Last Checked: {data.last_up}</h3>
              </div>
            );
          }}/>
        <br/>
        <br/>
        <RaisedButton
          label="Return"
          onClick={this.returnClick}/>
      </div>
    )

    switch(this.state.page) {
        case VIEWENUM.ENTRY:
          return entryView;
        case VIEWENUM.MONITOR:
          return monitorView;
        default:
          return entryView;
        }
  }

  handleIdInput = (e, text) => {
    this.setState({entryField: text})
  }

 componentDidMount() {
   document.title = "Trim Chair Counter"
 }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Trim Chair Counter Monitor</h1>
          </header>
          {this.pageRender()}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
