const UserReducer = (currentState, action) => {
    switch (action.type) {
        case 'login':
            return action.payload;
        case 'logout':
            return null;
        case 'update_user':
            return action.payload
    }
    return currentState
}

const EmployerReducer = (state, action) => {
    switch (action.type) {
        case 'updateEmployer':
            return action.payload;
    }
    return state
}

export {EmployerReducer}
export default UserReducer