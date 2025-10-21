import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($userInput: UserInput) {
    createUser(userInput: $userInput) {
      _id
      name
      email
      phone
      userType
      status
    }
  }
`;

export const EDIT_USER = gql`
  mutation EditUser($userInput: UserInput) {
    editUser(userInput: $userInput) {
      _id
      name
      email
      phone
      userType
      status
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id) {
      message
      success
    }
  }
`;
