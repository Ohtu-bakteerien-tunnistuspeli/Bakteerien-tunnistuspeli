import { ProgressBar } from 'react-bootstrap'

const PasswordQualityIndicator = ({ value, show, messages }) => {
  if (value === 0 && show) {
    return (
      <div>
        <ProgressBar label={messages.level0} variant="danger" now={100} />
      </div>
    )
  }
  if (value === 1 && show) {
    return (
      <div>
        <ProgressBar label={messages.level1} variant="danger" now={100} />
      </div>
    )
  }
  if (value === 2 && show) {
    return (
      <div>
        <ProgressBar label={messages.level2} variant="warning" now={100} />
      </div>
    )
  }
  if (value === 3 && show) {
    return (
      <div>
        <ProgressBar label={messages.level3} variant="success" now={100} />
      </div>
    )
  }

  if (value === 4 && show) {
    return (
      <div>
        <ProgressBar label={messages.level4} variant="success" now={100} />
      </div>
    )
  }

  return <div></div>
}

export default PasswordQualityIndicator
