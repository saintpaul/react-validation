const React = require('react');
const ReactDom = require('react-dom');
const ValidationField = require('../src/js/ValidationField');
const ValidationSubmit = require('../src/js/ValidationSubmit');
const CustomSelect = require("./CustomSelect");

// TODO RCH : add components like "CustomDatePicker" when they'll be on github
class Demo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            character: "",
            description: "",
            german: "",
            bio: "",
            age: undefined,
            nickname: "",
            level: "",
            spell: "",
            avatarUrl: "",
            terms: false
        }
    }

    onChangeCharacter = (value) => this.setState({ character: value });
    onChangeDescription = (value) => this.setState({ description: value });
    onChangeGerman = (value) => this.setState({ german: value });
    onChangeBio = (value) => this.setState({ bio: value });
    onChangeNickname = (value) => this.setState({ nickname: value });
    onChangeAge = (value) => this.setState({ age: value });
    onChangeLevel = (value) => this.setState({ level: value });
    onChangeSpell = (value) => this.setState({ spell: value });
    onChangeAvatarUrl = (value) => this.setState({ avatarUrl : value });
    onChangeTerms = (value) => {
        console.log("on change terms")
        this.setState({ terms: value });
    }

    onSubmit = (errors) => {
        // For debugging only
        //let displayErrors = errors ? JSON.stringify(errors) : "No errors";
        //window.alert(`Form errors : ${displayErrors}`);
    };

    validateSpell = (val, callback) => {
        if(val && !val.startsWith("fire")) {
            callback("Spell's name should start with 'fire");
        }
    };
    onChangeChecked = (val) => {
        console.log('change checked : ', val.target.checked);
        this.setState({ checked: val.target.checked });
    }

    validate(value, callback) {
        if(!value) {
            callback();
        }
    }

    render = () => (
        <div className="demo">
            Demo page
            <br/>
            <br/>
            <label>Character name (required) : </label>
            <ValidationField name="character" rules={{ required: true, message: "<a href='http://www.google.fr'> No idea ? Google is your friend</a>" }}>
                <input type="text" value={this.state.character} onChange={this.onChangeCharacter}/>
            </ValidationField>
            <label>Description (default rule, trigger on blur)</label>
            <ValidationField name="description" triggerOnBlur>
                <input type="text" value={this.state.description} onChange={this.onChangeDescription}/>
            </ValidationField>
            <label>German (huge error message)</label>
            <ValidationField name="german" rules={{ required: true, message: "Das Passwort muss aus mind. 8 Zeichen bestehen und sollte einen Buchstaben sowie eine Ziffer enthalten."}}>
                <input type="text" value={this.state.german} onChange={this.onChangeGerman}/>
            </ValidationField>
            <label>Biography (not required, no icons)</label>
            <ValidationField name="bio" rules={{ required: false, type: "string" }} showIcons={false}>
                <input type="text" value={this.state.bio} onChange={this.onChangeBio} />
            </ValidationField>
            <label>Nickname (max: 6 chars): </label>
            <ValidationField name="nickname" rules={{ required: true, max: 6 }} count>
                <input type="text" value={this.state.nickname} onChange={this.onChangeNickname}/>
            </ValidationField>
            <label>Age (number, min 18, no icons by default) : </label>
            <ValidationField name="age"  rules={{ required: true, type: "number", min: 18 }}>
                <CustomSelect value={this.state.age} onChange={this.onChangeAge} options={[16, 17, 18, 19, 20, 21, 22, 23, 24, 25 ]}/>
            </ValidationField>
            <br/>
            <label>Level (number, min 1) : </label>
            <ValidationField name="level" rules={{ required: true, type: "number", min: 1 }}>
                <input type="text" value={this.state.level} onChange={this.onChangeLevel}/>
            </ValidationField>
            <label>Spell : (should start with 'fire')</label>
            <ValidationField name="spell" rules={[ { required: true, type: "string" }, { validator: (val, callback) => this.validateSpell(val, callback) } ]}>
                <input type="text" value={this.state.spell} onChange={this.onChangeSpell}/>
            </ValidationField>
            <label>Avatar URL : (should starts with 'http://')</label>
            <ValidationField name="avatarUrl" rules={{ required: true, type: "string", pattern: /^http:\/\/.*$/ }}>
                <input type="text" value={this.state.avatarUrl} onChange={this.onChangeAvatarUrl}/>
            </ValidationField>
            <ValidationField name="terms" label="General terms" rules={[
                { type: "boolean" },
                { validator : this.validate }
            ]}>
                <input type="checkbox" checked={this.state.terms} onChange={this.onChangeTerms}/>
            </ValidationField>
            <ValidationSubmit onSuccess={this.onSubmit}>SUBMIT</ValidationSubmit>
        </div>
    );
}

ReactDom.render(<Demo />, document.getElementById('wrapper'));
