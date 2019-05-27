import {Binary, ObjectId} from 'mongodb'

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
    export interface ImageFile {
        _id?: ObjectId, // _ makes it possible to add custom id
        patient: string,
        images: string[],
        date: Date,
        notes: string
    }
    
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
        phone?: string,
        password?: string
        metrics: string // id of patients metric
    }

    export interface PatientMetrics {
        id?: string,
        dateOfBirth: Date,
        weight: number,
        height: number,
        notes: string,
        updatedAt: Date
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
