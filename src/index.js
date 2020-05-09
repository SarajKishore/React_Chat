import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import {BrowserRouter as Router,Switch,Route,withRouter} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

import firebase from './firebase';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './Reducers';
import {setUser,clearUser} from './actions';
import Spinner from './Spinner';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component{
  componentDidMount(){
    firebase.auth().onAuthStateChanged(user=>{            //checks if a user is logged in or not
      if(user){
        //console.log(user);
        this.props.setUser(user);
        this.props.history.push('/')//Redirect to home route
      }else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    })
  }
  render(){
    return this.props.isLoading ? <Spinner /> :(

        <Switch>
          <Route exact path="/" component={App} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </Switch>

    )
  }
}

const mapStateFromProps = state =>({
  isLoading : state.user.isLoading
})

const RootWithAuth = withRouter(connect(mapStateFromProps,{setUser,clearUser})(Root))

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>
  ,
  document.getElementById('root')
);

serviceWorker.unregister();
