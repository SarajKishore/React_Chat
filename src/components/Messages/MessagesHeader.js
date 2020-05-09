import React from 'react';
import {Header, Segment, Icon, Input } from 'semantic-ui-react';

class MessagesHeader extends React.Component{
    render(){
        const { channelName,numUniqueUsers,handleSearchChange,isPrivateChannel, handleStar,isChannelStarred }=this.props;
        return(
            <Segment clearing>       {/*clear fix on float items to one side or another */}
            {/*Channel Title */}
                <Header fluid="true" as="h2" floated="left" style={{marginBottom : 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && (
                        <Icon                   /* To star or unstar a channel*/
                        onClick={handleStar}
                        name={isChannelStarred ? 'star' : 'star outline'} 
                        color={isChannelStarred ? 'yellow' : 'black'}
                    />)}  
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>

            {/*Channel search    Input */}
                <Header floated="right">
                    <Input
                        onChange={handleSearchChange}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        );
    }
}

export default MessagesHeader;