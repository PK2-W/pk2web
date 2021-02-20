import { PkTickable } from '@fwk/support/PkTickable';
import { PkUIComponent } from '@fwk/ui/component/PkUIComponent';
import { PkUIContext } from '@fwk/ui/PkUIContext';

export abstract class PkUIComponentContainer<T extends PkUIContext = PkUIContext>
    extends PkUIComponent<T>
    implements Iterable<PkUIComponent>, PkTickable {
    
    protected _children: PkUIComponent[];
    
    protected constructor(context: T) {
        super(context);
        
        this._children = [];
    }
    
    
    ///  Content  ///
    
    public hasChildren(): boolean {
        return this._children.length > 0;
    }
    
    public getChildren(): PkUIComponent[] {
        return [...this._children];
    }
    
    public get children(): number {
        return this._children.length;
    }
    
    /**
     * Returns TRUE if the specified component is direct child of this container.
     *
     * @param child - Component to check.
     */
    public has(child: PkUIComponent): boolean {
        return this._children.indexOf(child) > -1;
    }
    
    /**
     * Adds a component as a child of this container component.<br>
     * If the component is already child, nothing is done.
     *
     * @param child - Component to add.
     */
    public add(child: PkUIComponent): this {
        // If it's aready child -> do nothing
        if (child.parent !== this) {
            // Detach from existing container
            if (child.parent != null) {
                child.parent.remove(child);
            }
            
            // Add to collection
            this._children.push(child);
            this._dw.add(child.getDrawable());
            
            // Notify child
            // @ts-ignore
            child._childOf(this);
        }
        
        return this;
    }
    
    /**
     * Removes a component that currently is child of this container component.<br>
     * If this condition is not satisfied nothing is done.
     *
     * @param child - Component to remove.
     */
    public remove(child: PkUIComponent): this {
        const i = this._children.indexOf(child);
        if (i > -1) {
            this._children.splice(i);
            this._dw.remove(child.getDrawable());
            
            // @ts-ignore
            child._childOf(null);
        }
        return this;
    }
    
    /**
     * Removes all children from the container.
     */
    public clean(): this {
        if (this.children > 0) {
            // @ts-ignore Detach from children
            this._children.forEach(component => component._childOf(null));
            // Clear collections
            this._children = [];
            this._dw.clear();
        }
        return this;
    }
    
    /**
     * Returns TRUE if the specified component is child or descendant (child of a child of a child...) of this container.
     *
     * @param descendant - Component to check.
     */
    public contains(descendant: PkUIComponent): boolean {
        if (descendant == null) {
            return false;
        }
        return descendant.isInside(this);
    }
    
    /**
     * Sets {@link visible} and {@link renderable} properties FALSE.<br>
     * Also removes the focus from the component or any other descendant that has it.
     */
    public hide(): this {
        if (this.visible || this.renderable) {
            // If a descentant has the focus, blur it before hide
            const screen = this.screen;
            if (screen != null && screen.focusedComponent !== this && this.contains(screen.focusedComponent)) {
                screen.focusedComponent.blur();
            }
            super.hide();
        }
        return this;
    }
    
    public showAll(): this {
        this._children.forEach(component => component.show());
        return this;
    }
    
    public hideAll(): this {
        this._children.forEach(component => component.hide());
        return this;
    }
    
    public [Symbol.iterator](): Iterator<PkUIComponent> {
        return new PkUITreeIterator(this);
    }
    
    
    ///  Game loop  ///
    
    public tick(delta: number, time: number): void {
        // Tick super...
        super.tick(delta, time);
        
        // Tick children
        for (let child of this._children) {
            child.tick(delta, time);
        }
    }
    
    
    /// Interaction  ///
    
    public get propagatePointerEvents(): boolean {
        return this.dw.interactiveChildren;
    }
    public set propagatePointerEvents(value: boolean) {
        this.dw.interactiveChildren = value;
    }
    
}

export class PkUITreeIterator implements Iterator<PkUIComponent> {
    private _aux: PkUIComponent[];
    
    public constructor(component: PkUIComponentContainer) {
        this._aux = [];
        this._aux.push(...component.getChildren());
    }
    
    public next(): IteratorResult<PkUIComponent, any> {
        if (this._aux.length === 0) {
            return { done: true, value: undefined };
        }
        
        const current = this._aux.shift();
        if (current instanceof PkUIComponentContainer && current.hasChildren()) {
            this._aux.unshift(...current.getChildren());
        }
        
        return { value: current };
    }
}