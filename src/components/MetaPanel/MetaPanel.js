import React from 'react';
import {Segment, Accordion, Header, Icon, Image, List} from 'semantic-ui-react';

class MetaPanel extends React.Component{
    state={
        channel: this.props.currentChannel,
        privateChannel: this.props.isPrivateChannel,
        activeIndex: 0,
    }

    setActiveIndex = (event, titleProps)=>{
        const {index} = titleProps;
        const {activeIndex}= this.state;
        const newIndex= activeIndex === index ? -1 : index;
        this.setState({
            activeIndex : newIndex
        })
    }

    formatCount = num =>(num > 1 || num===0) ? `${num} posts` : `${num} post`;

    displayTopPosters = posts =>(
        Object.entries(posts) //converts key of objects and its value into array ex- {b: 1, c:2} to 0: ["b",1] 1: ["c",2]
            .sort((a,b)=> b[1]-a[1])    //compares count values and arrange it in descending order
            .map(([key,val],i)=>(
                <List.Item key={i}>
                    <Image avatar src={val.avatar}/>
                    <List.Content>
                        <List.Header as="a">{key}</List.Header>
                        <List.Description>{this.formatCount(val.count)} posts</List.Description>
                    </List.Content>
                </List.Item>
            ))
            .slice(0,3) //To Limit no. of top posters
    )

    render(){
        const {activeIndex, privateChannel,channel}= this.state;
        const {userPosts}= this.props;

        if(privateChannel) return null; // So metachannel is not displayed when on a private channel
        //also used because it takes certain time for channel to come to state so for that time display nothing (using OR !channel)

        return(
            <Segment loading={!channel}>  {/*For showing loading on metachannel while channel state is being loaded*/}
                <Header as="h3" attached="top">
                    About # {channel && channel.name}  {/*Shows data only when channel is loaded  */}
                </Header>
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="info" />
                        Channel Details
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                     {channel && channel.details}   
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="user circle" />
                            Top Posters 
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                            {userPosts && this.displayTopPosters(userPosts)}
                        </List>
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="pencil alternate" />
                        createdBy
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                       <Header as="h3">
                            <Image circular src={channel && channel.createdBy.avatar}/>
                            {channel && channel.createdBy.name}
                       </Header>
                    </Accordion.Content>

                </Accordion>
            </Segment>
        )
    }
}
export default MetaPanel;