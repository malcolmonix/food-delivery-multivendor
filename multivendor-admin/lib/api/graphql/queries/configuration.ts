import { gql } from 'graphql-request';

export const GET_CONFIGURATION = gql`
  query GetConfiguration {
    configuration {
      _id
      pushToken
      webClientID
      publishableKey
      clientId
      googleApiKey
      webAmplitudeApiKey
      appAmplitudeApiKey
      googleColor
      webSentryUrl
      apiSentryUrl
      customerAppSentryUrl
      restaurantAppSentryUrl
      riderAppSentryUrl
      skipEmailVerification
      skipMobileVerification
      currency
      currencySymbol
      deliveryRate
      googleMapLibraries
      twilioEnabled
      twilioAccountSid
      twilioAuthToken
      twilioPhoneNumber
      firebaseKey
      appId
      authDomain
      storageBucket
      msgSenderId
      measurementId
      projectId
      dashboardSentryUrl
      cloudinaryUploadUrl
      cloudinaryApiKey
      vapidKey
      isPaidVersion
      email
      emailName
      password
      enableEmail
      clientSecret
      sandbox
      secretKey
      formEmail
      sendGridApiKey
      sendGridEnabled
      sendGridEmail
      sendGridEmailName
      sendGridPassword
      androidClientID
      iOSClientID
      expoClientID
      termsAndConditions
      privacyPolicy
      testOtp
      enableRiderDemo
      enableRestaurantDemo
      enableAdminDemo
      costType
    }
  }
`;

