import { Binary } from 'mongodb'

export namespace JobsDb {
    export interface Job {
        id?: string,
        status: JobStatus,
        owner: string, // id of doctors user
        patient: string // id of patient
        imageFile: string // id of image file
        facts: string[], // ids of facts
        conclusions: string[] // ids of conclusions
        created: Date,
        updated: Date,
    }
    
    export enum JobStatus { NEW, WORKING, DONE }
    
    export interface Premise {
        id?: string,
        head: string,
        set: string[],
        conjuction: boolean
    }
    
    export interface Fact extends Premise {
        grfIrf: GrfIrf
    }
    
    export interface Rule {
        id?: string,
        premises: Premise[],
        conclusion: Premise,
        grfIrf: GrfIrf
    }
    
    export interface GrfIrf {
        grf: number,
        irf: number
    }
}

export namespace ImagesDb {
    export interface Image {
        id?: string,
        image: Binary,
        date: Date,
        notes: string
    }
}   

export namespace PatientsDb {
    export interface Patient {
        id?: string,
        firstName: string,
        lastName: string,
        pesel: number,
        email: string,
        phone?: number,
        password?: string
    }
    
    export interface PatientMetrics {
        id?: string,
        dateOfBirth: Date,
        weight: number,
        height: number,
        notes: string
    }
}

export namespace UsersDb {
    export interface User {
        id?: string,
        type: UserType,
        login: string,
        password: string,
        name: string,
        email: string,
        phone: number
    }
    
    export enum UserType { DOCTOR, ADMIN }
}
