'use client';

import { useState, useEffect, FormEvent, FC } from 'react';
import { useLocations, useEquipment, FORM_API_BASE_URL } from '../../hooks/useEquipmentForm'; 
import { EquipmentNode, Message } from '../../types'; 

const LOG_TYPES = ["FAILURE", "REPAIR", "REPLACEMENT"];

// Helper function to get the current time in HH:MM format
const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};


// The EquipmentTree helper component remains the same.
const EquipmentTree: FC<{ 
    nodes: EquipmentNode[]; 
    selectedEquipmentId: number | null;
    onSelect: (id: number) => void;
    level?: number;
}> = ({ nodes, selectedEquipmentId, onSelect, level = 0 }) => {
    /* ... (same implementation as before) ... */
    return (
        <div className="space-y-2">
            {nodes.map(node => (
                <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
                    <div className="flex items-center">
                        <input
                            id={`eq-${node.id}`}
                            type="radio"
                            name="equipmentSelection"
                            value={node.id}
                            checked={selectedEquipmentId === node.id}
                            onChange={() => onSelect(node.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor={`eq-${node.id}`} className="ml-2 block text-sm text-gray-900">
                            {node.text}
                        </label>
                    </div>
                    {node.children && node.children.length > 0 && (
                        <EquipmentTree 
                            nodes={node.children} 
                            selectedEquipmentId={selectedEquipmentId}
                            onSelect={onSelect}
                            level={level + 1} 
                        />
                    )}
                </div>
            ))}
        </div>
    );
};


// ========= MAIN FORM COMPONENT (with Timestamp) =========
export default function EquipmentLogForm() {
    const { 
        dropdowns: locationDropdowns, 
        finalLocationId, 
        handleLocationChange, 
        resetLocations 
    } = useLocations();

    const { 
        equipmentTree, 
        isLoading: isLoadingEquipment, 
    } = useEquipment(finalLocationId);
    
    // --- STATE MANAGEMENT ---
    // CHANGED: Renamed 'date' to 'eventDate' for clarity and added 'eventTime' state
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [eventTime, setEventTime] = useState(getCurrentTime());
    
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [logType, setLogType] = useState<string>(LOG_TYPES[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    // Effect to clear selection when location changes
    useEffect(() => {
        setSelectedEquipmentId(null);
    }, [finalLocationId]);

    // --- EVENT HANDLERS ---
    const resetForm = () => {
        setEventDate(new Date().toISOString().split('T')[0]);
        setEventTime(getCurrentTime());
        setSelectedEquipmentId(null);
        setLogType(LOG_TYPES[0]);
        setNotes('');
        resetLocations();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Validation logic remains mostly the same
        if (!selectedEquipmentId) {
            setMessage({ text: 'Please select a piece of equipment.', type: 'error' });
            return;
        }
        if (!notes.trim()) {
            setMessage({ text: 'Please provide notes for the log.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        // NEW: Combine date and time into a single ISO string for the API
        const event_timestamp = `${eventDate}T${eventTime}:00`;

        const url = `${FORM_API_BASE_URL}/equipment/${selectedEquipmentId}/log_failure`;
        // CHANGED: Added event_timestamp to the data payload
        const data = {
            notes,
            log_type: logType,
            event_timestamp,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'An unknown error occurred.');

            setMessage({ text: 'Success! The equipment failure has been logged.', type: 'success' });
            resetForm();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setMessage({ text: `Submission failed: ${errorMessage}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = isSubmitting || !selectedEquipmentId || !notes.trim();

    // --- JSX (UI) ---
    return (
        <div className="bg-gray-100 text-gray-800 font-sans p-4 sm:p-6 md:p-8">
            <div className="container mx-auto max-w-3xl">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Log Equipment Event</h1>
                        <p className="text-gray-500 mt-2">Select a location, choose equipment, and describe the event.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Location Selection */}
                        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-800">1. Location Selection</h3>
                            {/* ... (location dropdowns implementation is unchanged) ... */}
                            <div className="flex flex-col space-y-4">
                               {locationDropdowns.map(({ level, options, selectedValue }) => (
                                    <div key={level}>
                                        <label htmlFor={`location-level-${level}`} className="block text-sm font-medium text-gray-700 mb-1">Location Level {level}</label>
                                        <select 
                                            id={`location-level-${level}`}
                                            value={selectedValue}
                                            onChange={(e) => handleLocationChange(e.target.value, level)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        >
                                            <option value="">Select Level {level}</option>
                                            {options.map(loc => <option key={loc.id} value={loc.id}>{loc.text}</option>)}
                                        </select>
                                    </div>
                               ))}
                            </div>
                        </div>

                        {/* Equipment Selection */}
                        {finalLocationId && (
                           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="font-semibold text-lg text-gray-800 mb-3">2. Select Equipment (Single)</h3>
                                {isLoadingEquipment ? (
                                    <div className="flex justify-center items-center h-20"><div className="spinner"></div></div>
                                ) : equipmentTree.length > 0 ? (
                                   <EquipmentTree 
                                        nodes={equipmentTree} 
                                        selectedEquipmentId={selectedEquipmentId} 
                                        onSelect={setSelectedEquipmentId} 
                                    />
                                ) : (
                                    <p className="text-gray-500 mt-2">No equipment found for this location.</p>
                                )}
                            </div>
                        )}

                        {/* Event Details Section */}
                        {selectedEquipmentId && (
                            <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="font-semibold text-lg text-gray-800">3. Event Details</h3>
                                
                                {/* NEW: Date and Time Picker Inputs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input 
                                            type="date" 
                                            id="eventDate" 
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            required 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                        <input 
                                            type="time" 
                                            id="eventTime" 
                                            value={eventTime}
                                            onChange={(e) => setEventTime(e.target.value)}
                                            required 
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="logType" className="block text-sm font-medium text-gray-700 mb-1">Log Type</label>
                                    <select 
                                        id="logType"
                                        value={logType}
                                        onChange={(e) => setLogType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                    >
                                        {LOG_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea 
                                        id="notes" 
                                        rows={4}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Describe the event..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Submit Button & Message Area */}
                         <div className="pt-4 flex items-center justify-end">
                            <button type="submit" disabled={isSubmitDisabled} className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <span>{isSubmitting ? 'Submitting...' : 'Submit Log'}</span>
                                {isSubmitting && <div className="spinner ml-3"></div>}
                            </button>
                        </div>
                         {message && (
                            <div className="mt-6 text-center">
                               <div className={`p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message.text}
                               </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}