import { Button } from 'react-bootstrap'
import HintForm from './HintForm'
import ModalImage from '../utility/ModalImage'
import CaseForm from './CaseForm'
import { useSelector } from 'react-redux'

const CaseListing = ({ caseItem, admin, deleteCase }) => {
  const library = useSelector(state => state.language)?.library?.frontend.case.listing
  return (
    <>
      {admin ? (
        <tr>
          <td>{caseItem.name.length < 40 ? caseItem.name : `${caseItem.name.substring(0, 40)}...`}</td>
          <td>
            {caseItem.completionImage ? (
              <ModalImage imageUrl={caseItem.completionImage.url} width={'10%'} height={'10%'} />
            ) : (
              <></>
            )}
          </td>
          <td>
            <Button
              variant="danger"
              style={{ float: 'right', margin: '2px' }}
              id="deleteCase"
              onClick={() => {
                if (window.confirm(library.deleteConfirm)) {
                  deleteCase(caseItem)
                }
              }}
            >
              {library.delete}
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                className="bi bi-trash"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
            </Button>
            <HintForm caseToUpdate={caseItem}></HintForm>
            <CaseForm caseToEdit={caseItem} modify={true}></CaseForm>
          </td>
        </tr>
      ) : (
        <></>
      )}
    </>
  )
}

export default CaseListing
