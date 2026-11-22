import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Modal } from 'react-bootstrap'
import GDBRText from './user/GDPRText'
import PrivacyText from './user/PrivacyText'
import ImageCopyrightText from './user/ImageCopyrightText'

const Footer = () => {
  const [showGDPR, setShowGDPR] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showImageCopyright, setShowImageCopyright] = useState(false)
  const library = useSelector(state => state.language)?.library?.frontend.footer
  return (
    <div className="footer">
      <p className="navbar-text">
        {library.copyright}
        &nbsp;
        {
          <a href="#" onClick={() => setShowGDPR(true)}>
            {library.gdbr}
          </a> //eslint-disable-line
        }
        ,&nbsp;
        {
          <a href="#" onClick={() => setShowPrivacy(true)}>
            {library.privacy}
          </a> //eslint-disable-line
        }
        &nbsp; ja&nbsp;
        {
          <a href="#" onClick={() => setShowImageCopyright(true)}>
            {library.imageCopyright}
          </a> //eslint-disable-line
        }
        &nbsp;
      </p>
      <Modal show={showGDPR} size="lg" onHide={() => setShowGDPR(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <GDBRText></GDBRText>
        </Modal.Body>
      </Modal>
      <Modal show={showPrivacy} size="lg" onHide={() => setShowPrivacy(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <PrivacyText></PrivacyText>
        </Modal.Body>
      </Modal>
      <Modal show={showImageCopyright} size="lg" onHide={() => setShowImageCopyright(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <ImageCopyrightText></ImageCopyrightText>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Footer
