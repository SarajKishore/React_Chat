import React from 'react';
import firebase from '../../firebase';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions';

class Starred extends React.Component{
    state={
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        activeChannel: '', 
        starredChannels: [],
    }

    componentDidMount(){
        if(this.state.user){
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners= ()=>{
        this.state.userRef.child(`${this.state.user.uid}/starred`).off();
    }

    addListeners = userId =>{
        this.state.userRef      //Listens to the userRef to check for any changes in the starred property
            .child(userId)
            .child('starred')
            .on('child_added', snap=>{
                const starredChannel= {id: snap.key, ...snap.val()};
                this.setState({
                    starredChannels : [...this.state.starredChannels, starredChannel]
                });
            });

        this.state.userRef      //Listens to the userRef to check for any changes in the starred property
            .child(userId)
            .child('starred')
            .on('child_removed', snap =>{
                const channelToRemove= {id: snap.key, ...snap.val()};
                const filteredChannel= this.state.starredChannels.filter(channel=>{ //This filters the array and removes those channel which have id equal to channelToRemove.id
                    return channel.id !== channelToRemove.id;
                });
                this.setState({
                    starredChannels : filteredChannel
                })
            })

    }

    setActiveChannel = channel =>{
        this.setState({activeChannel : channel.id})
    }

    changeChannel=  channel =>{
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);        //to switch back from direct messages to channel
    };

    displayChannels= starredChannels =>(
        starredChannels.length > 0 && starredChannels.map(channel=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}
            >
                # {channel.name}
            </Menu.Item>
         ) )
    )

    render(){
        const {starredChannels} = this.state;
        return(
            <Menu.Menu className="menu">     {/*Child of main menu component*/}
                <Menu.Item>
                    <span>
                        <Icon name="star"/> STARRED
                    </span>{" "}
                    ({starredChannels.length}) 
                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        );
    }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(Starred);