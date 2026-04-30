import EventEmitter from "eventemitter3";

import type { BrokerEvents } from "../types";

/**
 * The Broker is the central event hub of the Synapse engine.
 * It allows different parts of the system to communicate by emitting and listening to events.
    */

class TypedBroker{
    private emitter:EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
    }

    emit<k extends keyof BrokerEvents>(event: k, payload: BrokerEvents[k]): void {
        this.emitter.emit(event, payload);
        console.log('Emitting', event, payload);
    }
    
    on<k extends keyof BrokerEvents>(event: k, listener: (payload: BrokerEvents[k]) => void): void {
        this.emitter.on(event, listener);
        console.log('Subscribing to', event, listener);
    }   

    off<k extends keyof BrokerEvents>(event: k, listener: (payload: BrokerEvents[k]) => void): void {
        this.emitter.off(event, listener);
    }
    
    subscribe<k extends keyof BrokerEvents>(event: k, listener: (payload: BrokerEvents[k]) => void): () => void {
        this.on(event, listener);
        return () => {
            this.off(event, listener);
            console.log('Unsubscribing from', event, listener);
        };
    }

    clear (): void {
        this.emitter.removeAllListeners();
    }
    

}
export const Broker = new TypedBroker();