import 'jodit'
import JoditEditor from 'jodit-react'

const options = {
  toolbar: false,
  readonly: true,
  spellcheck: false,
  toolbarButtonSize: 'large',
  showXPathInStatusbar: false,
  buttons: '|,|',
  preset: 'inline',
}

const FormattedText = ({ value }) => {
  return <JoditEditor value={value} config={options} onChange={''} />
}

export default FormattedText
