const React = require('react');
const ReactDom = require('react-dom');
const ValidationField = require('../src/js/ValidationField');
const ValidationSubmit = require('../src/js/ValidationSubmit');


class Demo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            character: "",
            nickname: "",
            level: "",
            spell: ""
        }
    }

    onChangeCharacter = (value) => this.setState({ character: value });
    onChangeNickname = (value) => this.setState({ nickname: value });
    onChangeLevel = (value) => this.setState({ level: value });
    onChangeSpell = (value) => this.setState({ spell: value });
    onChangeAvatarUrl = (value) => this.setState({ avatarUrl : value });

    onSubmit = (errors) => {
        let displayErrors = errors ? JSON.stringify(errors) : "No errors";
        window.alert(`Form errors : ${displayErrors}`);
    };

    validateSpell = (val, callback) => {
        if(val && !val.startsWith("fire")) {
            callback("Spell's name should start with 'fire");
        }
    };

    render = () => (
        <div>
            Demo page
            <br/>
            <br/>
            <label>Character name (required) : </label>
            <ValidationField name="character" rules={{ required: true }}>
                <input type="text" value={this.state.character} onChange={this.onChangeCharacter}/>
            </ValidationField>
            <br/>
            <label>Nickname (max: 6 chars): </label>
            <ValidationField name="counted" rules={{ required: true, max: 6 }} count>
                <input type="text" value={this.state.nickname} onChange={this.onChangeNickname}/>
            </ValidationField>
            <br/>
            <label>Level (min 1) : </label>
            <ValidationField name="level" rules={{ required: true, type: "number", min: 1 }}>
                <input type="text" value={this.state.level} onChange={this.onChangeLevel}/>
            </ValidationField>
            <br/>
            <label>Spell : </label>
            <ValidationField name="spell" rules={[ { required: true, type: "string" }, { validator: (val, callback) => this.validateSpell(val, callback) } ]}>
                <input type="text" value={this.state.spell} onChange={this.onChangeSpell}/>
            </ValidationField>
            <br/>
            <label>Avatar URL : </label>
            <ValidationField name="avatarUrl" rules={{ required: true, type: "string", message: "<a href='http://www.google.fr'> No idea ? Google is your friend</a>" }}>
                <input type="text" value={this.state.avatarUrl} onChange={this.onChangeAvatarUrl}/>
            </ValidationField>
            <ValidationSubmit onSuccess={this.onSubmit}>SUBMIT</ValidationSubmit>
        </div>
    );
}

ReactDom.render(<Demo />, document.getElementById('wrapper'));
