import 'jodit'
import 'jodit/build/jodit.min.css'
import JoditEditor from 'jodit-react'

const options = {
    'spellcheck': false,
    'toolbarButtonSize': 'large',
    'showXPathInStatusbar': false,
    'height': 280,
    'buttons': '|,bold,strikethrough,underline,italic,eraser,|,font,fontsize,brush,paragraph,|,superscript,subscript,|,ul,ol,|,outdent,indent,align,,link,|,undo,redo,\n,copy,paste,|,preview,about'
}

const TextEditField = ({ value, handleChange, invalid, fieldId }) => {
    return (
        <JoditEditor
            id={fieldId}
            value={value}
            config={options}
            onChange={(value) => handleChange(value)}
            isInvalid={invalid}
        />
    )
}

export default TextEditField