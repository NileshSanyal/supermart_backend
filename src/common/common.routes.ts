import express, { Application } from 'express';
export abstract class CommonRoutes {
    app: Application;
    name: string;

    constructor(app: Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }

    /**
     *
     * @returns {string} name of the route.
     * It is used for debugging purpose
     */
    getName(): string {
        return this.name;
    }

    abstract configureRoutes(): Application;
}
