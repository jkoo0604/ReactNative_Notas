const initialState = {
    user: null,
    notebooks: [],
    notebook: {},
    notes: [],
    note: {},
    currentNotes: [],
}

function reducer(state=initialState, action) {
    switch(action.type) {
        case 'LOGIN':
            return {...state, user: action.user};
        case 'LOGOUT':
            return {...state, user: null};
        case 'NOTEBOOKS':
            return {...state, notebooks: action.notebooks};
        case 'ONENOTEBOOK':
            return {...state, notebook: action.notebook};
        case 'NOTES':
            return {...state, notes: action.notes};
        case 'CURRENTNOTES':
            return {...state, currentNotes: action.currentNotes};
        case 'ONENOTE':
            return {...state, note: action.note};
        default:
            return state;
    }
}

export default reducer;