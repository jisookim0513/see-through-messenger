var socket = null;

var ChatBox = React.createClass({
    getInitialState: function() {
        return {
            messages: this.props.messages,
            latest: null,
            latestMine: null
        };
    },
    componentDidMount: function() {
	var that = this;

        this.socket = new WebSocket('ws://' + window.location.host);
        socket = this.socket;
        
	this.socket.onmessage = function(event) {
            try {
                var data = JSON.parse(event.data);
            } catch (e) {
                console.log('badly formatted: ' + event.data);
            }
            
            console.log(data);

            if(data['message']) {
                // update messages
                // clear latest message
                var messages = that.state.messages.concat(data);
                
                that.setState({messages: messages, latest: null});
            } else if(typeof data['text'] === 'string') {
                // update latest message
                that.setState({latest: data});
            } else if(typeof data['name'] === 'string') {
                that.name = data['name'];
            }
        }

        $(window).on('beforeunload', function(){
            this.socket.close();
        });

        this.socket.onopen = function() {
            that.socket.send(JSON.stringify({
                cookie: docCookies.getItem('cookie')
            }));
        }
    },

    updateMessage: function(text, callback) {
        this.socket.send(JSON.stringify({text: text}));
        this.setState({latestMine: {from: this.name, text: text}});
        if(callback) {
            callback();
        }
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
    },

    submitMessage: function(text, callback) {
        this.socket.send(JSON.stringify({text: text, message: true}));
        this.setState({latestMine: null});
        if(callback) {
            callback();
        }
        $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
    },
    
    render: function() {
        return (
            <div className="wrapper">
            <div className="chatBox" id="chatBox">
            <MessageList messages={this.state.messages}/>
            <LatestMessage message={this.state.latest}/>
            <LatestMessage message={this.state.latestMine}/>
            </div>
            <div className="messageInput">
            <MessageForm submitMessage={this.submitMessage} updateMessage={this.updateMessage}/>
            </div>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render: function () {
	var Messages = (<div>Loading messages...</div>);
	if (this.props.messages) {
	    Messages = this.props.messages.map(function (msg) {
		return (<Message key={msg.id} message={msg} />);
	    });
	}
	return (
	    <div className="messageList">
	    {Messages}
	    </div>
	);
    }
});

var Message = React.createClass({
    render: function() {
        var classes = "message";
        if(this.props.latest) {
            classes += " latest";
        }
        return (
            <div className={classes}>
            <span className="author">{this.props.message.from}</span>:&nbsp;
	    <span className="body">{this.props.message.text}</span>
	    </div>
        );
    }
});

var LatestMessage = React.createClass({
    render: function() {
        if(this.props.message && this.props.message.text != "") {
            return ( <Message message={this.props.message} latest={true} /> );
        } else {
            return false;
        }
    }
});

var MessageForm = React.createClass({
    handleSubmit: function (e) {
	e.preventDefault();
	var that = this;
	var text = this.refs.text.getDOMNode().value;
	var message = text;
	// var submitButton = this.refs.submitButton.getDOMNode();
	// submitButton.innerHTML = 'submitting...';
	// submitButton.setAttribute('disabled', 'disabled');
	this.props.submitMessage(message, function (err) {
	    that.refs.text.getDOMNode().value = '';
	    // submitButton.innerHTML = 'submit';
	    // submitButton.removeAttribute('disabled');
	});
    },

    handleChange: function(e) {
        this.props.updateMessage(e.target.value);
    },
    
    render: function () {
	return (
	    <form className="commentForm" onSubmit={this.handleSubmit}>
	    <input className="enterMessage" name="text" ref="text" placeholder="&hearts;"
            onChange={this.handleChange}
                      required />
	    </form>
	);
    }
    //<button type="submit" ref="submitButton">submit</button>

});
var messages = [];

$(function() {
    React.render(
        <ChatBox messages={messages}/>,
        document.getElementById('content')
    );
});

