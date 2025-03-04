import React, { useState } from 'react';

import { Link, Section, BigButton } from '../../components';
import Profile from '../../components/Profile';
import Signup from '../../components/Signup';
import Signin from '../../components/Signin';

export default (props) => {
    const [signup, setSignup] = useState(true);
    if (!props.user) {
        return (
            <>
            <Section>
                <Link onClick={() => setSignup(!signup)}>{signup ? 'Chci se prihlasit': 'Chci se zaregistrovat'}</Link>
                <br />
                { !signup && <Signin /> }
                { signup && <Signup /> }
            </Section>
            <Section>
                <BigButton text="LEAVE" onClick={() => props.setIsProfileView(false)} />
            </Section>
            </>
        ) 
    }

    return (
        <div>
            <div style={{
                backgroundColor: 'white',
                padding: '30px 15% 130px 15%',
            }}>
                <Profile user={props.user} characters={props.characters} roles={props.roles} role={props.role} teams={props.teams} />
            </div>
            <Section>
                <BigButton text="LEAVE" onClick={() => props.setIsProfileView(false)} />
            </Section>
        </div>
    );
    
}

