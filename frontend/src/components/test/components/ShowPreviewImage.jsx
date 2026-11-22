import { Image } from 'react-bootstrap'

const ShowPreviewImage = ({ imgPreview }) => {
  return imgPreview ? <Image src={imgPreview} thumbnail width={100}></Image> : null
}

export default ShowPreviewImage
