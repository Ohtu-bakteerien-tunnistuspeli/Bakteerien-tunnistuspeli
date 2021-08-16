import React from 'react'
import { useSelector } from 'react-redux'
import FormattedText from '../case/components/FormattedText'
import '../../style.css'

const PrivacyText = () => {
    const library = useSelector(state => state.language)?.library?.frontend.user
    return (
        <div className='container'>
            <FormattedText value={library.privacy} />
        </div>
    )
}

export default PrivacyText