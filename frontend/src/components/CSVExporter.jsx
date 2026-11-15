import { useSelector } from 'react-redux'
import { CSVLink } from 'react-csv'
import { Button } from 'react-bootstrap'
const CSVExport = ({ data }) => {
    const library = useSelector(state => state.language)?.library?.frontend.csvExport
    const headers = [
        { label: library.studentNumber, key: 'studentNum' },
        { label: library.email, key: 'email' },
        { label: library.classGroup, key: 'class' },
        { label: library.credits, key: 'cases' }
    ]

    let cleanData = []
    for (let i = 0; i < data.length; i++) {
        const credit = {
            studentNum: data[i].user.studentNumber,
            email: data[i].user.email,
            class: data[i].user.classGroup,
            cases: data[i].testCases.toString()
        }
        cleanData = cleanData.concat(credit)
    }

    const csvReport = {
        data: cleanData,
        headers: headers,
        filename: `${library.filename}.csv`
    }

    return (
        <>
            <CSVLink {...csvReport}>
                <Button className="small-margin-float-right" variant='success'>{library.exportButton}</Button>
            </CSVLink>
        </>
    )
}


export default CSVExport