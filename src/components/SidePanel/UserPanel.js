import React from 'react';
import {Grid, Header, Icon, Dropdown,Image} from 'semantic-ui-react';
import firebase from '../../firebase';

class UserPanel extends React.Component{
    state={
        user: this.props.currentUser,
    }



    dropdownOptions=()=>[
        {
            key:'user',
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key:'avatar',
            text: <span>Change Avatar</span>
        },
        { 
            key:'signout',
            text:<span onClick={this.handleSignOut}>Sign Out</span>
        },
    ];

    handleSignOut=()=>{
        firebase
            .auth()
            .signOut()
            .then(()=>{
                console.log('Signed out :)')
            })
    }

    render(){
        const {user} = this.state;
        return(
            <Grid style={{background: '#4c3c4c'}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em', margin: 0}}>
                        {/*App header */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>GaxChat</Header.Content>
                        </Header> 

                    {/*User Dropdown */}
                    <Header inverted as="h4" style={{padding:'0.25em'}}>
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced="right" avatar/>
                                {user.displayName}
                            </span>
                        } options={this.dropdownOptions()}/>
                    </Header>
                    </Grid.Row>
                </Grid.Column>
            </Grid>
        )
    }
}

export default UserPanel;