import React from 'react';
import {Segment, Accordion, Header, Icon, Image} from 'semantic-ui-react';

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

    render(){
        const {activeIndex, privateChannel,channel}= this.state;

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
                        Posters
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