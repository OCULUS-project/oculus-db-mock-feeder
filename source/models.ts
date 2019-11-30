import { ObjectId } from 'mongodb'

export type integer = BigInt

/** data of inference jobs */
export namespace JobsDb {
    export interface Job {
        _id?: ObjectId,
        status: JobStatus,
        doctor: string, // id of doctors user
        patient: string // id of patient
        imageFile: string // id of image file
        patientMetrics: string, // ids of facts
        created: Date,
        updated: Date,
    }

    export enum JobStatus { NEW = "NEW", IN_PROGRESS = "IN_PROGRESS", DONE = "DONE" }

}

/** data of rules, facts and conclusions */
export namespace FactsDb {

    /** rule on which the inference is based */
    export interface Rule {
        _id?: ObjectId,
        /** premises of the rule */
        premises: Premise[],
        /** conlusion of the rule */
        conclusion: Premise,
        grfIrf: GrfIrf
    }

    /** premise for a rule */
    export interface Premise {
        _id?: ObjectId,
        head: string,
        set: string[],
        conjunction: boolean
    }

    /** premise with GrfIrf */
    export interface Fact extends Premise {
        grfIrf: GrfIrf
    }

    export interface SourceFact extends Fact {
        /** id of job the facts belongs to */
        job: string,
        /** source from which the fact was infered or generated */
        source: FactSource
    }

    export interface ResultFact extends Fact {
         /** id of job the conclusion belongs to */
         job: string,
    }

    /** factor of reliability of the entity */
    export interface GrfIrf {
        /** level of the dependence of a rule’s conclusion on rule’s premises */
        grf: number,
        /** quality of the underlying rule */
        irf: number
    }

    /** explains the source from which the fact was infered or generated */
    export interface FactSource {
        type: FactSourceType,
        /** id of source entity */
        id: string
    }

    /** types of facts sources */
    export enum FactSourceType { 
        METRICS = 'METRICS', 
        IMAGE = 'IMAGE'
    }

    /** an entity that can be converted into fact */
    export interface AttributeTemplate {
        name: String,
        unit: AttributeUnit,
        type: AttributeType,
        regex: String,
        /** values to choose from */
        values: String[],
        /** range of number values <min, max> */
        range: {
            min: String,
            max: String
        },
        /** explanation of the attribute */
        description: String,
    }

    /** the unit of the value of the datatype */
    export enum AttributeUnit {
        // lenght
        METER = 'METER',
        CENTIMETER = 'CENTIMETER',
        
        // weight
        KILOGRAM = 'KILOGRAM',
        GRAM = 'GRAM',

        // angle
        DEGREE = 'DEGREE',
        
        // other
        UNIT = 'UNIT',
        PERCENT = 'PERCENT',
        NONE = 'NONE'
    }

    /** data type of the value of the attribute */
    export enum AttributeType {
        INT = 'INT',
        UINT = 'UINT',
        FLOAT = 'FLOAT',
        UFLOAT = 'UFLOAT',
        STRING = 'STRING'
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
        /** date of creation */
        date: Date,
        /** notes */
        notes: string
    }
    
    /** stores data of image location in the filesystem */
    export interface Image {
        _id?: ObjectId,
        /** id of file the image belongs to */
        fileId: String,
        /** path to image in the file system */
        path: string,
        /** date of creation */
        date: Date,
        /** list of scaled versions of thw image */
        scaled: []
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
        pesel: integer,
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
        /** results of examination */
        attributes: Map<string, string>
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
        phone: integer
    }

    export enum UserType { DOCTOR, ADMIN }
}
