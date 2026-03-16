import React from 'react';
import { BoxJourneyListMobile } from './BoxJourneyListMobile';
import { BoxJourneyListDesktop } from './BoxJourneyListDesktop';

interface BoxJourneyListProps {
    journeys: any[];
    viewMode: 'grid' | 'timeline';
    setViewMode: (mode: 'grid' | 'timeline') => void;
    setIsCreateJourneyModalOpen: (val: boolean) => void;
    navigate: (path: string) => void;
    boxName: string;
}

export const BoxJourneyList: React.FC<BoxJourneyListProps> = (props) => {
    return (
        <div className="w-full">
            <BoxJourneyListMobile {...props} />
            <BoxJourneyListDesktop {...props} />
        </div>
    );
};