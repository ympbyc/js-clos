;; Interface for BiwaScheme
;; There are many caveats due to somewhat poor js<->scheme interface of current biwa. Be warned

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; JS-CLOS: https://github.com/ympbyc/js-clos  ;;;
;;; A super tiny clos-like object system for js ;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(js-load "clos.js")

;;another option is to modify and load tiny-clos
;;but javascript implementation is way faster

(import-js-symbols CLOS)

;; Define-generic is *required* before defining methods
(define-macro (define-generic name . memoize)
  (let ([mem (if (null? memoize) #f (car memoize))])
    `(define
       ,name
       (: CLOS 'define_generic ,mem))))

;; (define-method name ((obj <specializer>)
;;                      obj2
;;                      (obj1 <specializer>))
;;   body)
;; <specializer> is one of a:
;;   + class
;;   + value (compared with js ===)
;;   + js string as results in call to typeof
;; This is (in a way) way more powerful than CL's define-method
(define-macro (define-method gener argspec . body)
  (let ([args (fold-right (lambda (x acc)
                            (if (pair? x)
                                (cons (cons (cadr x) (car acc))
                                      (cons (car x) (cdr acc)))
                                (cons (cons '(js-eval "undefined") (car acc))
                                      (cons x (cdr acc))))) '(() . ()) argspec)])
    `(: CLOS 'define_method
	,gener
	(list->vector (list ,@(car args)))
	(js-closure (lambda ,(cdr args) ,@body)))))

;;(define-class name (super1 super2 ...))
;;(define-class name (super1 super2 ...)
;;  (lambda (o) (clos-slot-exists o 'slot-name 'slot-type)))
;; Think inside out and you'll get it
(define-macro (define-class name parents . fn)
  (let ((fn (if (null? fn) (js-eval "null")
		`(js-close ,(car fn)))))
      `(define ,name
	 (: CLOS 'define_class
	    (list->vector ,parents)
	    ,fn
	    ,name))))


;; In js-clos noting has to be named.
(define (make-class parents . fn)
  (if (null? fn)
      (: CLOS 'define_class
	 (list->vector parents))
      (: CLOS 'define_class
	 (list->vector parents)
	 (js-close (car fn)))))


;; make
(define (make class alist)
  (: CLOS 'make class
     (alist->js-obj (map
		     cons
		     (map symbol->string (map car alist))
		     (map cdr alist)))))

;; is-a
(define-macro (clos-is-a x y)
  `(: CLOS 'isA ,x ,y))

;; check whether x has slot key that clos-is-a typ
(define (clos-slot-exists x key typ)
  (: CLOS 'slot_exists key typ))
