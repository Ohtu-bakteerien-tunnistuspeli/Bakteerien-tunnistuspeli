import { useState } from 'react'
export const useField = (type, initialState) => {
    const [value, setValue] = useState(initialState)
    const onChange = (event) => {
        setValue(event.target.value)
    }
    const reset = () => {
        setValue('')
    }
    return {
        type,
        value,
        onChange,
        reset
    }
}

export const INITIAL_STATE = {
    id: '',
    bacterium: '',
    image: undefined,
}

export const marginStyle = { margin: '10px' }