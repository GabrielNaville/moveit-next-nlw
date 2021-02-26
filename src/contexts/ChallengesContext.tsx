import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookie from 'js-cookie';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number
}

interface ChallengesContextInterface {
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    experienceToNextLevel: number;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    completedChallenge: () => void;
    closedLevelUpModal: () => void;

}

export const ChallengesContext = createContext({} as ChallengesContextInterface);

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number
}

export function ChallengesProvider({ 
    children,
    ...rest
} : ChallengesProviderProps ) {
    const [ level, setLevel ] = useState(rest.level  ?? 1);
    const [ currentExperience, setCurrentExperience ] = useState(rest.currentExperience ?? 0);
    const [ challengesCompleted, setChallengesCompleted ] = useState(rest.challengesCompleted ?? 0);
    const [ activeChallenge, setActiveChallenge] = useState(null)
    const [ isLevelUpModalOpen,  setIsLevelUpModalOpen]  =useState(null)

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2 )

    useEffect( () => {
        Notification.requestPermission();
    }, []);

    useEffect( () => {
        Cookie.set('level', String(level));
        Cookie.set('currentExperience', String(currentExperience));
        Cookie.set('challengesCompletes', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]);


    function levelUp() {
        setLevel(level + 1);
        setIsLevelUpModalOpen(true);
    }

    function startNewChallenge() {
        const randomChallengesIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomChallengesIndex];

        setActiveChallenge(challenge);

        new Audio('/notification.mp3').play()

        if(Notification.permission === 'granted') {
            new Notification('Novo Desafio', {
                body: `Valendo ${challenge.amount}xp`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null)
    }

    function closedLevelUpModal() {
        setIsLevelUpModalOpen(false);
    }

    function completedChallenge() {
        if(!activeChallenge) {
            return;
        }
        const { amount } = activeChallenge;

        let finalExperience = currentExperience + amount;

        if(finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
    }

    return (
        <ChallengesContext.Provider value={{
            level, 
            currentExperience, 
            challengesCompleted,
            activeChallenge,
            experienceToNextLevel,
            levelUp,
            startNewChallenge,
            resetChallenge,
            completedChallenge,
            closedLevelUpModal}}>
            {children}

           { isLevelUpModalOpen && <LevelUpModal />}
        </ChallengesContext.Provider>
    )
}
