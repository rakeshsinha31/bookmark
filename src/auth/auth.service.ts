import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    signup() {
        return 'i am sign up...'
    }

    signin() {
        return 'i am sign innn...'
    }
}
