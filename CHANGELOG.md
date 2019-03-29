# Change Log

## 4.3.0
**technical improvments**
- Support Gulp 4
- Support Babel 7

## 4.2.0
**security improvements**
- Fix version of 'event-stream' to 3.3.4

## 4.1.0
**technical improvments**
- Support React 16

## 4.0.0
**technical improvments**
- Upgrade Reflux
- Use `sp-react-commons` from npm instead of `react-commons` from github
- Use `PropTypes` from `prop-types` and not `React.PropTypes`

## 3.2.0.
**technical improvements**
- No more automatic magic behavior for react-select-wrapper. Now, you need to specify showIcons={false}.

## 3.1.2.
**technical improvements**
- Add release script

## 3.1.0
**features**
- Add support for "group". 
Some fields can be attached to a group, which means they will be validated together.
It also means we can have several groups in the same form, to have a fine-grained validation. 

## 3.0.1
**features**
- Add support for textarea (display border in colors, do not display icon by default)
- Add "charsLeftThreshold" prop to display remaining chars message according to a function

## 3.0.0
**technical improvements**
- Defined PeerDependencies and specific lodash require instead of global lodash 

## 2.4.2
**technical improvements**
- Add an "input-wrapper" to correctly display icon 

## 2.4.1
**technical improvements**
- Refactor "label" feature by adding CSS classes and change it's position

## 2.4.0
**features**
- Add a way to translate error messages by adding "MESSAGES" key in Configuration file

## 2.3.3
**technical improvements**
- Remove error message from DOM if there is no error

## 2.3.2
**bug fixes**
- Prevent Tooltip to stop event propagation

## 2.3.1
**features**
- Add 'className' prop to ValidationField

## 2.3.0
**features**
- Display tooltip onClick event

**technical improvements**
- Remove font-awesome dependency
- Add Configuration.js file
- Add 2 props "iconValidClass" and "iconErrorClass"
- Remove props error in the console

## 2.2.0
**features**
- In mobile/tablet mode, show error under each field instead of tooltip

## 2.1.0
**features**
- Display an error near submit button if form contains errors
- Display error field with a bigger border

## 2.0.6
**bug fixes**
- Fix rendering issue (tooltip was still displayed even if there were no error)

## 2.0.5
**bug fixes**
- Fix issue with datepicker props (inputProps was ignored)

## 2.0.4
**bug fixes**
- Fix warning in the console (something wrong in tooltip library)

## 2.0.3
**bug fixes**
- Force border colors on focus.
- Add exception for DatePicker (onBlur)

## 2.0.2
**technical improvements**
- Add "ValidationTypes" for special component support like Select and Datepicker
**bug fixes**
- Fix react-dom version to 0.14.8
- Fix some CSS

## 2.0.1
**bug fixes**
- Fix Tooltip issue (using unnecessary ref)

## 2.0.0
**features**
NO BREAKING CHANGES, ONLY LAYOUT CHANGES
- Change global layout of validation field
- Display a "valid" and "error" icon on each validation field
- Error message is now displayed on over "error" icon
- Add SCSS files
- Add external dependencies (font-awesome + react-tooltip)

## 1.1.1
**bug fixes**
- Fix issue when validating a field during 'onBlur' event

## 1.1.0
**technical improvements**
- Remove warning in the console (bsStyle invalid prop)

**features**
- Rename confusing 'onBlur' prop to 'triggerOnBlur'

## 1.0.6
**features**
- Error message now support HTML

## 1.0.5
**features**
- Display an error if 2 ValidationFields are declared with the same value

## 1.0.4
**Bug fixes**
- Fix "propTypes" typo

## 1.0.3
**features**
- Add support for 'count' property (display a counter with number of typed characters) 

**technical improvements**
- Refactor rule conversion

## 1.0.2
**technical improvements**
- Use new github repository for reflux-component

## 1.0.1
**features**
- Add renderFactory method to customize rendering of the ValidationSubmit component

## 1.0.0
- Initialization
