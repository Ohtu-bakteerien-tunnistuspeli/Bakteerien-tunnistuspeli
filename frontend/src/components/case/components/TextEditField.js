import React from 'react'
import 'jodit'
import 'jodit/build/jodit.min.css'
import JoditEditor from 'jodit-react'

const options = {
    'spellcheck': false,
    'toolbarButtonSize': 'large',
    'showXPathInStatusbar': false,
    'buttons': '|,bold,strikethrough,underline,italic,eraser,|,font,fontsize,brush,paragraph,|,superscript,subscript,|,ul,ol,|,outdent,indent,align,,link,|,undo,redo,\n,copy,paste,|,preview,about'
}

const TextEditField = ({ value, onChange, onBlur, isInvalid }) => {
    return (
        <JoditEditor
            value={value}
            config={options}
            onChange={(value) => onChange(value)}
            onBlur={onBlur}
            isInvalid={isInvalid}
        />
    )
}

export default TextEditField