import React from 'react';
import './App.css';
import {Grid} from 'semantic-ui-react';
import {connect} from 'react-redux';

import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';


const App =({currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor})=>(
  <Grid columns="equal" className="app" style={{background: secondaryColor}}>
    <ColorPanel 
      key={currentUser && currentUser.name}
      currentUser={currentUser}
    />
    <SidePanel 
      key={currentUser && currentUser.id}
      currentUser={currentUser}
      primaryColor={primaryColor}
    />
    <Grid.Column style={{marginLeft: 320}}>
      <Messages
        key={currentChannel && currentChannel.id}   //when providing props to multiple components we need to provide a unique identifier a key
        currentChannel={currentChannel}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>


    <Grid.Column width={4}>
      <MetaPanel 
      key={currentChannel && currentChannel.name} //so it renders properly
      userPosts={userPosts}
      currentChannel={currentChannel}
      isPrivateChannel={isPrivateChannel}/>
    </Grid.Column>
  </Grid> 
)

const mapStateToProps = state =>({
  currentUser: state.user.currentUser,     //taking current user value and passing it as props to SidePanel which again send this value to UserPanel as a prop
  currentChannel: state.channel.currentChannel,  //taking current user value and passing it as props to Messages which again send this value to MessageForm as a prop
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor 
})

export default connect(mapStateToProps)(App);
