import ConfirmWindow from './utility/ConfirmWindow.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { deleteUser } from '../reducers/usersReducer.js'
import { useHistory } from 'react-router-dom'
import ProfilePageUserInfo from './ProfilePageUserInfo.js'
import UserinfoForm from './user/UserinfoForm.jsx'

const ProfilePage = () => {
    const library = useSelector(state => state.language)?.library?.frontend.profilePage
    const user = useSelector(state => state.user)
    const credits = useSelector(state => state.credit)
    const history = useHistory()
    const dispatch = useDispatch()
    const userDelete = ({ confirmText, handleClose }) => {
        dispatch(deleteUser(user, user.token, confirmText, handleClose, history))
    }

    return (
        <div>
            <h3>{library.title}</h3>
            <div>
                <ProfilePageUserInfo credit={credits.filter(credit => credit.user.id === user.id).length > 0 ? credits.filter(credit => credit.user.id === user.id)[0] : null} user={user} />
            </div>
            <ConfirmWindow
                listedUser={user}
                buttonId='deleteUser'
                modalOpenButtonText={library.button}
                modalOpenButtonVariant='danger'
                modalHeader={`${library.modalHeaderStart}${user.username}${library.modalHeaderEnd}`}
                warningText={library.warning}
                functionToExecute={userDelete}
                executeButtonText={library.executeButton}
                executeButtonVariant='danger'
                password={true}
                parameter={true}
            />
            <div>
                <UserinfoForm user={user}></UserinfoForm>
            </div>
        </div>
    )
}

export default ProfilePage