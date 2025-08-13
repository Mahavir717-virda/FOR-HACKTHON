import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';

const ActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/profile/activity', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }
                const data = await response.json();
                setActivities(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) {
        return <Container><p>Loading activities...</p></Container>;
    }

    return (
        <Container>
            <Header>
                <FaBell />
                <h1>Your Activity</h1>
            </Header>
            <ActivityList>
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <ActivityItem key={activity._id}>
                            <ActivityInfo>
                                <ActivityType>{activity.activityType.replace('_', ' ')}</ActivityType>
                                <ActivityDescription>{activity.description}</ActivityDescription>
                            </ActivityInfo>
                            <ActivityTimestamp>
                                {new Date(activity.createdAt).toLocaleString()}
                            </ActivityTimestamp>
                        </ActivityItem>
                    ))
                ) : (
                    <p>No recent activity.</p>
                )}
            </ActivityList>
        </Container>
    );
};

export default ActivityPage;

const Container = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
    color: #333;
    margin-bottom: 2rem;
`;

const ActivityList = styled.ul`
    list-style: none;
    padding: 0;
`;

const ActivityItem = styled.li`
    background: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ActivityInfo = styled.div``;

const ActivityType = styled.h3`
    text-transform: capitalize;
    margin: 0 0 0.5rem 0;
`;

const ActivityDescription = styled.p`
    margin: 0;
    color: #666;
`;

const ActivityTimestamp = styled.span`
    color: #999;
    font-size: 0.9rem;
`;
