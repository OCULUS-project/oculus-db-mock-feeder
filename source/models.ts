import { ObjectId } from 'mongodb'

export namespace JobsDb {
    export interface Job {
        _id?: ObjectId,
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
        _id?: ObjectId,
        head: string,
        set: string[],
        conjuction: boolean
    }

    export interface Fact extends Premise {
        grfIrf: GrfIrf
    }

    export interface Rule {
        _id?: ObjectId,
        premises: Premise[],
        conclusion: Premise,
        grfIrf: GrfIrf
    }

    export interface GrfIrf {
        grf: number,
        irf: number
    }
}

/** data of eye fundus images */
export namespace ImagesDb {

    /** aggregates images from one series */
    export interface ImageFile {
        _id?: ObjectId,
        /** patient id */
        patient: string,
        /** doctor id [user id] */
        author: string,
        /** list of images ids */
        images: string[],
        /** date of creation */
        date: Date,
        /** notes */
        notes: string
    }
    
    /** stores data of image location in the filesystem */
    export interface Image {
        _id?: ObjectId,
        /** path to image in the file system */
        path: string,
        /** date of creation */
        date: Date,
        /** notes */
        notes: string
    }
}

/** data of patients */
export namespace PatientsDb {

    /** personal and contact data of the patient */
    export interface Patient {
        _id?: ObjectId,
        firstName: string,
        lastName: string,
        pesel: number,
        email: string,
        phone?: string,
        /** password for remote access to inference results */
        password?: string
    }

    /** data from examination of the patietnt */
    export interface PatientMetrics {
        _id?: ObjectId,
        /** patients id */
        patient: string,
        /** id of issuing doctor */
        doctor: string,
        /** date of creation */
        date: Date,
        /** some notes */
        notes: string,

        // other properites - to settle with doctor // TODO
        weight: number,
        height: number,
    }
}

/** data of users [doctors and admins] */
export namespace UsersDb {
     /** personal, contact login data of the user */
    export interface User {
        _id?: ObjectId,
        type: UserType,
        login: string,
        password: string,
        name: string,
        email: string,
        phone: number
    }

    export enum UserType { DOCTOR, ADMIN }
}
