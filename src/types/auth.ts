export type Tokens = {
    access_token: string
    refreshToken?: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    access_token: string
    token_type: string
}



