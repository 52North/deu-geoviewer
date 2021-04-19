import { HttpErrorResponse } from '@angular/common/http';
import { TranslateDefaultParser } from '@ngx-translate/core';

import { CkanResource } from '../../model';

export abstract class ViewerError {

    protected translationParser = new TranslateDefaultParser();

    constructor(
        protected requestUrl: string,
        protected ckanResource: CkanResource
    ) { }

    public abstract get url(): string;

    public abstract get messageKey(): string;

    public abstract get titleKey(): string;

    protected abstract createSummary(translation: any): string;

    protected abstract createDescription(translation: any): string;

    protected abstract createErrorType(): string;

    public createTicket(translation: any): string {
        let ticket = 'type=0&summary=' + this.createSummary(translation);
        ticket += '&description=' + this.createDescription(translation);
        ticket += '&dataset=' + this.resourceId;
        ticket += '&component=' + 'geo-visualisation';
        ticket += '&errortype=' + this.createErrorType() + '; Type=' + this.resourceType;
        return ticket;
    }

    protected get resourceId(): string {
        return (this.ckanResource && this.ckanResource.id) ? this.ckanResource.id : 'n/a';
    }

    protected get resourceType(): string {
        return (this.ckanResource && this.ckanResource.type) ? this.ckanResource.type : 'n/a';
    }
}

export enum NotSupportedReason {
    crs = 'crs',
    encoding = 'encoding',
    metadata = 'metadata',
    fileFormat = 'fileFormat',
    dataRequest = 'dataRequest'
}

export class NotSupportedError extends ViewerError {

    constructor(
        protected requestUrl: string,
        protected ckanResource: CkanResource,
        public reason: NotSupportedReason
    ) {
        super(requestUrl, ckanResource);
    }

    public get url(): string {
        return this.requestUrl;
    }

    public get messageKey(): string {
        if (this.reason) {
            return `error.detailedErrors.${this.reason}`;
        }
        return '';
    }

    public get titleKey(): string {
        return 'error.general.serviceNotSupported';
    }

    protected createSummary(translation: any): string {
        return `${this.translationParser.getValue(translation, this.titleKey)}; Dataset: ${this.resourceId}`;
    }

    protected createDescription(translation: any): string {
        return `${this.translationParser.getValue(translation, this.messageKey)}`;
    }

    protected createErrorType(): string {
        return `${this.reason}; Type=${this.resourceType}`;
    }

}

export class NotAvailableError extends ViewerError {

    constructor(
        protected requestUrl: string,
        protected ckanResource: CkanResource,
        private error: any
    ) {
        super(requestUrl, ckanResource);
    }

    public get url(): string {
        if (this.error instanceof HttpErrorResponse && this.error.url) {
            return this.error.url;
        }
        return this.requestUrl;
    }

    public get messageKey(): string {
        if (this.error instanceof HttpErrorResponse && this.error.status) {
            return `error.httpIssues.${this.error.status}`;
        }
        return `error.httpIssues.generic`;
    }

    public get titleKey(): string {
        return 'error.general.serviceNotAvailable';
    }

    protected createSummary(translation: any): string {
        return `${this.translationParser.getValue(translation, this.titleKey)}; Dataset: ${this.resourceId}`;
    }

    protected createDescription(translation: any): string {
        let result = `${this.translationParser.getValue(translation, this.messageKey)}; `;

        if (this.error instanceof HttpErrorResponse && this.error.status) {
            result += ` HTTP Status: ${this.error.status}`;
        }
        if (this.error instanceof HttpErrorResponse && this.error.url) {
            result += `; URL: ${this.error.url}`;
        }
        return result;
    }

    protected createErrorType(): string {
        if (this.error instanceof HttpErrorResponse) {
            return this.error.message + ' (' + this.error.status + ')';
        }
        return 'n/a';
    }
}
